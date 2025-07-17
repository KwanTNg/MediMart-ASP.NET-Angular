namespace Core.Specifications;

public class UserSpecParams : PagingParams
{
    public string? OrderBy { get; set; }
    protected new const int MaxPageSize = 100;
    public override int PageSize
    {
        get => _pageSize;
        set => _pageSize = (value > MaxPageSize) ? MaxPageSize : value;
    }
}
