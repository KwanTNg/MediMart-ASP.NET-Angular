using System.Security.Claims;
using System.Threading.Tasks;
using API.DTOs;
using API.Extensions;
using Core.Entities;
using Core.Interfaces;
using Core.Specifications;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore.Metadata.Internal;


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
        await GenerateEmailConfirmationTokenAsync(user);

        return Ok();
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<ActionResult> Logout()
    {
        await signInManager.SignOutAsync();
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
