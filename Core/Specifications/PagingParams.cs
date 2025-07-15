namespace Core.Specifications;

public class PagingParams
{
    //Pigination part 2
    protected const int MaxPageSize = 60;
    public int PageIndex { get; set; } = 1;
    protected int _pageSize = 6;
    public virtual int PageSize
    {
        get => _pageSize;
        set => _pageSize = (value > MaxPageSize) ? MaxPageSize : value;
    }

}
