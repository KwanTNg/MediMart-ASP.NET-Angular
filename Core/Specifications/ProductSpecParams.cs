using System.Dynamic;

namespace Core.Specifications;

public class ProductSpecParams : PagingParams
{

    private List<string> _brands = [];
    public List<string> Brands
    {
        get => _brands;
        set
        {
            _brands = value.SelectMany(x => x.Split(',',
            StringSplitOptions.RemoveEmptyEntries)).ToList();
        }
    }

    private List<string> _types = [];
    public List<string> Types
    {
        get => _types;
        set
        {
            _types = value.SelectMany(x => x.Split(',',
            StringSplitOptions.RemoveEmptyEntries)).ToList();
        }
    }

    private List<string> _categories = [];
    public List<string> Categories
    {
        get => _categories;
        set
        {
            _categories = value.SelectMany(x => x.Split(',',
            StringSplitOptions.RemoveEmptyEntries)).ToList();
        }
    }

    private List<int> _symtomIds = [];
    public List<int> SymptomIds
    {
        get => _symtomIds;
        set
        {
            _symtomIds = value.SelectMany(x => x.ToString().Split(',',
            StringSplitOptions.RemoveEmptyEntries)).Select(int.Parse)
            .ToList();
        }
    }

    public string? Sort { get; set; }

    private string? _search;
    public string Search
    {
        get => _search ?? "";
        set => _search = value.ToLower();
    }
}
