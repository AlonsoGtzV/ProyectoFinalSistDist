using Microsoft.EntityFrameworkCore;
using DokkanSoapApi.Infrastructure;
using DokkanSoapApi.Models;
using DokkanSoapApi.Mappers;
using DokkanSoapApi.Infrastructure.Entities;
using System.ServiceModel;
using System.IdentityModel.Tokens;

namespace DokkanSoapApi.Repositories;

public class UserRepository : IUserRepository
{
    private readonly RelationalDbContext _dbContext;

    public UserRepository(RelationalDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<UserModel> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var user = await _dbContext.Users.AsNoTracking().FirstOrDefaultAsync(s => s.Id == id, cancellationToken);
        return user.ToModel();
    }

    public async Task<UserModel> CreateAsync(UserModel user, CancellationToken cancellationToken)
    {
        var userEntity = user.ToEntity();
        userEntity.Id = Guid.NewGuid();
        await _dbContext.AddAsync(userEntity, cancellationToken);
        await _dbContext.SaveChangesAsync();
        return userEntity.ToModel();
    }
}
