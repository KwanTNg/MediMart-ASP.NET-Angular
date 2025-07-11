using System.Collections.Concurrent;
using Core.Entities;
using Core.Interfaces;

namespace Infrastructure.Data;

public class UnitOfWork(StoreContext context) : IUnitOfWork
{
    private readonly ConcurrentDictionary<string, object> _repositories = new();
    public async Task<bool> Complete()
    {
        return await context.SaveChangesAsync() > 0;
    }

    public void Dispose()
    {
        context.Dispose();
    }

    //When we use unit of work, we specify the type of repo we want
    public IGenericRepository<TEntity> Repository<TEntity>() where TEntity : BaseEntity
    {
        //Give use the name of the entity we are using for a particular repository
        //Get type name base on entity type
        var type = typeof(TEntity).Name;
        //return instance of generic repo, if cannot find in concurrent dict, add to dict
        return (IGenericRepository<TEntity>)_repositories.GetOrAdd(type, t =>
        {
            var respositoryType = typeof(GenericRepository<>).MakeGenericType(typeof(TEntity));
            return Activator.CreateInstance(respositoryType, context)
            ?? throw new InvalidOperationException(
                $"Could not create repository instance for {t}");
        });
    }
}
