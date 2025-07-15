using System.Runtime.CompilerServices;

namespace Core.Specifications;

public class OrderSpecParams : PagingParams
{
    public string? Status { get; set; }

    protected new const int MaxPageSize = 500;
    public override int PageSize
    {
        get => _pageSize;
        set => _pageSize = (value > MaxPageSize) ? MaxPageSize : value;
    }

}
