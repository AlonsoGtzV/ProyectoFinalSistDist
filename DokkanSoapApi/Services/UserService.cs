using System.ServiceModel;
using DokkanSoapApi.Contracts;
using DokkanSoapApi.Dtos;
using DokkanSoapApi.Repositories;
using DokkanSoapApi.Mappers;

namespace DokkanSoapApi.Services;

public class UserService : DokkanContract{
    private readonly IUserRepository _userRepository;

    public UserService(IUserRepository UserRepository){
        _userRepository = UserRepository;
    }

    public async Task<UserResponseDto> CreateUser(UserCreateRequestDto userRequest, CancellationToken cancellationToken)
    {
        var user = userRequest.ToModel();
        var createdUser = await _userRepository.CreateAsync(user, cancellationToken);
        return createdUser.ToDto();
    }

public async Task<UserResponseDto> GetUserById(Guid userId, CancellationToken cancellationToken)
{
    var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
    if (user is not null)
    {
        return user.ToDto();
    }
    throw new FaultException("User Not Found");
    }
}
