using DokkanSoapApi.Models;

namespace DokkanSoapApi.Repositories;

public interface IUserRepository{
    Task<UserModel> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    public Task<UserModel> CreateAsync(UserModel user, CancellationToken cancellationToken);


}