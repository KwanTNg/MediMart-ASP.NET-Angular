using System.Security.Claims;
using API.DTOs;
using API.Extensions;
using Core.Entities;
using Core.Interfaces;
using Core.Specifications;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;


namespace API.Controllers;

public class AccountController(SignInManager<AppUser> signInManager,
    UserManager<AppUser> userManager, IEmailService emailService,
    IConfiguration configuration) : BaseApiController
{
    [HttpPost("register")]
    public async Task<ActionResult> Register(RegisterDto registerDto)
    {
        var user = new AppUser
        {
            FirstName = registerDto.FirstName,
            LastName = registerDto.LastName,
            Email = registerDto.Email,
            UserName = registerDto.Email
        };
        var result = await signInManager.UserManager.CreateAsync(user, registerDto.Password);
        if (!result.Succeeded)
        {
            foreach (var error in result.Errors)
            {
                ModelState.AddModelError(error.Code, error.Description);
            }
            return ValidationProblem();
        }

        var roleResult = await signInManager.UserManager.AddToRoleAsync(user, "Patient");
        if (!roleResult.Succeeded)
        {
            return BadRequest("Failed to assign role");
        }
        // await GenerateEmailConfirmationTokenAsync(user);

        return Ok();
    }

    [Authorize]
    [HttpGet("enable-2fa")]
    public async Task<IActionResult> Enable2FA()
    {
        var user = await userManager.GetUserAsync(User);
        var key = await userManager.GetAuthenticatorKeyAsync(user);

        if (string.IsNullOrEmpty(key))
        {
            await userManager.ResetAuthenticatorKeyAsync(user);
            key = await userManager.GetAuthenticatorKeyAsync(user);
        }

        var email = await userManager.GetEmailAsync(user);
        var authenticatorUri = $"otpauth://totp/Medimart:{email}?secret={key}&issuer=Medimart&digits=6";

        return Ok(new { key, qrCodeUrl = authenticatorUri });
    }

    [Authorize]
    [HttpPost("verify-2fa")]
    public async Task<IActionResult> Verify2FA(TwoFAVerificationDto twoFAVerificationDto)
    {
        var user = await userManager.GetUserAsync(User);
        if (user == null) return Unauthorized();
        var result = await userManager.VerifyTwoFactorTokenAsync(user,
            TokenOptions.DefaultAuthenticatorProvider, twoFAVerificationDto.Code);

        if (!result) return BadRequest("Invalid verification code");

        user.TwoFactorEnabled = true;
        await userManager.UpdateAsync(user);

        return Ok();
    }

    [Authorize]
    [HttpPost("disable-2fa")]
    public async Task<IActionResult> Disable2FA()
    {
        var user = await userManager.GetUserAsync(User);
        if (user == null)
            return Unauthorized();
        var disableResult = await userManager.SetTwoFactorEnabledAsync(user, false);
        if (!disableResult.Succeeded)
            return BadRequest("Failed to disable 2FA");
        // Reset authenticator key
        await userManager.ResetAuthenticatorKeyAsync(user);
        return Ok();
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto loginDto)
    {
        var user = await userManager.FindByEmailAsync(loginDto.Email);
        if (user == null) return Unauthorized("Invalid email or password");
        
        if (!await userManager.IsEmailConfirmedAsync(user))
                return BadRequest("Email not confirmed");

        if (await userManager.IsLockedOutAsync(user))
            return Unauthorized(new { message = "Account locked", accessFailedCount = user.AccessFailedCount, isLockedOut = true });

        if (!await userManager.CheckPasswordAsync(user, loginDto.Password))
        {
            await userManager.AccessFailedAsync(user);
            return Unauthorized(new { message = "Invalid email or password", accessFailedCount = user.AccessFailedCount });
        }
        
        await userManager.ResetAccessFailedCountAsync(user);

        // Temporarily sign in the user without persistence, pending 2FA verification
        if (await userManager.GetTwoFactorEnabledAsync(user))
        {
            await signInManager.SignInAsync(user, isPersistent: false);
            return Ok(new { require2FA = true, email = user.Email });
        }

        // Normal Login
        var result = await signInManager.PasswordSignInAsync(user, loginDto.Password,
            isPersistent: true, lockoutOnFailure: false);
        if (result.Succeeded)
        {
            return Ok(new { require2FA = false });
        }

        return BadRequest("Login failed");
        
    }

    [HttpPost("2fa-login")]
    public async Task<IActionResult> TwoFactorLogin(TwoFactorLoginDto twoFactorLoginDto)
    {
        var user = await userManager.FindByEmailAsync(twoFactorLoginDto.Email);
        if (user == null) return Unauthorized("Invalid attempt");

        var is2faTokenValid = await userManager.VerifyTwoFactorTokenAsync(user,
            TokenOptions.DefaultAuthenticatorProvider, twoFactorLoginDto.Code);

        if (!is2faTokenValid) return BadRequest("Invalid 2FA code");

        await signInManager.SignInAsync(user, isPersistent: true);
        return Ok();
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<ActionResult> Logout()
    {
        await HttpContext.SignOutAsync(IdentityConstants.ApplicationScheme);
        return NoContent();
    }

    //Since client cannot access httponly cookies, need to call this endpoint to get the user info
    [HttpGet("user-info")]
    public async Task<ActionResult> GetUserInfo()
    {
        if (User.Identity?.IsAuthenticated == false) return NoContent();
        var user = await signInManager.UserManager.GetUserByEmailWithAddress(User);

        return Ok(new
        {
            user.FirstName,
            user.LastName,
            user.Email,
            user.TwoFactorEnabled,
            Address = user.Address?.ToDto(),
            Roles = User.FindFirstValue(ClaimTypes.Role)
        });
    }

    [HttpGet("auth-status")]
    public ActionResult GetAuthState()
    {
        return Ok(new { IsAuthenticated = User.Identity?.IsAuthenticated ?? false });
    }

    [Authorize]
    [HttpPost("address")]
    public async Task<ActionResult<Address>> CreateOrUpdateAddress(AddressDto addressDto)
    {
        var user = await signInManager.UserManager.GetUserByEmailWithAddress(User);

        if (user.Address == null)
        {
            user.Address = addressDto.ToEntity();
        }
        else
        {
            user.Address.UpdateFromDto(addressDto);
        }

        var result = await signInManager.UserManager.UpdateAsync(user);
        if (!result.Succeeded) return BadRequest("Problem updating user address");
        return Ok(user.Address.ToDto());
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("change-role")]
    public async Task<ActionResult> ChangeUserRole(ChangeUserRoleDto dto)
    {
        var user = await userManager.FindByEmailAsync(dto.Email);
        if (user == null) return NotFound("User not found");

        var currentRoles = await userManager.GetRolesAsync(user);
        var removeResult = await userManager.RemoveFromRolesAsync(user, currentRoles);

        if (!removeResult.Succeeded)
            return BadRequest("Failed to remove current roles");

        var addResult = await userManager.AddToRoleAsync(user, dto.NewRole);
        if (!addResult.Succeeded)
            return BadRequest("Failed to assign new role");

        return Ok();
    }

    [HttpGet("test")]
    public async Task<ActionResult> Index()
    {
        UserEmailOptions options = new UserEmailOptions
        {
            ToEmails = new List<string>() { "test@gmail.com" },
            PlaceHolders = new List<KeyValuePair<string, string>>()
            {
                new KeyValuePair<string, string>("{{UserName}}", "Nitish")
            }
        };
        await emailService.SendTestEmail(options);
        return Ok();
    }

    [HttpGet("confirm-email")]
    public async Task<IActionResult> ConfirmEmail(string uid, string token)
    {

        if (!string.IsNullOrEmpty(uid) && !string.IsNullOrEmpty(token))
        {
            token = token.Replace(' ', '+');
            var result = await ConfirmEmailAsync(uid, token);
            if (!result.Succeeded)
            {
                return BadRequest("Something went wrong!");
            }
            return Ok();
        }
        return BadRequest("Something went wrong!");

    }

    [HttpPost("confirm-email")]
    public async Task<IActionResult> ConfirmEmail(EmailConfirm emailConfirm)
    {
        var user = await GetUserByEmailAsync(emailConfirm.Email);
        if (user == null) return NotFound("User not found");
        if (user.EmailConfirmed)
        {
            return BadRequest("Email was already confirmed.");
        }
        await GenerateEmailConfirmationTokenAsync(user);
        return Ok();
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword(ForgotPassword forgotPassword)
    {
        if (forgotPassword.EmailSent == false)
        {
            var user = await GetUserByEmailAsync(forgotPassword.Email);
            if (user != null)
            {
                await GenerateForgotPasswordTokenAsync(user);
            }
            forgotPassword.EmailSent = true;
        }
        return Ok();
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword(ResetPassword resetPassword)
    {
        if (ModelState.IsValid)
        {
            resetPassword.Token = resetPassword.Token.Replace(' ', '+');
            var result = await ResetPasswordAsync(resetPassword);
            if (result.Succeeded)
            {
                return Ok();
            }
            return BadRequest("Failed to reset password!");

        }
        return BadRequest("Something went wrong.");
    }

    private async Task SendEmailConfirmationEmail(AppUser user, string token)
    {
        string appDomain = configuration.GetSection("Application:AppDomain").Value;
        string confirmationLink = configuration.GetSection("Application:EmailConfirmation").Value;

        UserEmailOptions options = new UserEmailOptions
        {
            ToEmails = new List<string>() { user.Email },
            PlaceHolders = new List<KeyValuePair<string, string>>()
            {
                new KeyValuePair<string, string>("{{UserName}}", user.FirstName),
                new KeyValuePair<string, string>("{{Link}}", string.Format(appDomain + confirmationLink,
                    user.Id, token))
            }
        };
        await emailService.SendTestEmailConfirmation(options);
    }

    private async Task<IdentityResult> ConfirmEmailAsync(string uid, string token)
    {
        return await userManager.ConfirmEmailAsync(await userManager.FindByIdAsync(uid), token);
    }

    private async Task<IdentityResult> ResetPasswordAsync(ResetPassword resetPassword)
    {
        return await userManager.ResetPasswordAsync(await userManager.FindByIdAsync(resetPassword.UserId),
            resetPassword.Token, resetPassword.NewPassword);
    }

    private async Task GenerateEmailConfirmationTokenAsync(AppUser user)
    {
        var token = await userManager.GenerateEmailConfirmationTokenAsync(user);
        if (!string.IsNullOrEmpty(token))
        {
            await SendEmailConfirmationEmail(user, token);
        }
    }

    private async Task GenerateForgotPasswordTokenAsync(AppUser user)
    {
        var token = await userManager.GeneratePasswordResetTokenAsync(user);
        if (!string.IsNullOrEmpty(token))
        {
            await SendForgotPasswordEmail(user, token);
        }
    }

    private async Task<AppUser> GetUserByEmailAsync(string email)
    {
        return await userManager.FindByEmailAsync(email);
    }

    private async Task SendForgotPasswordEmail(AppUser user, string token)
    {
        string appDomain = configuration.GetSection("Application:AppDomain").Value;
        string confirmationLink = configuration.GetSection("Application:ForgotPassword").Value;

        UserEmailOptions options = new UserEmailOptions
        {
            ToEmails = new List<string>() { user.Email },
            PlaceHolders = new List<KeyValuePair<string, string>>()
            {
                new KeyValuePair<string, string>("{{UserName}}", user.FirstName),
                new KeyValuePair<string, string>("{{Link}}", string.Format(appDomain + confirmationLink,
                    user.Id, token))
            }
        };
        await emailService.SendEmailForFogotPassword(options);
    }

}
