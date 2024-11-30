using System.ServiceModel;
using DokkanSoapApi.Dtos;

namespace DokkanSoapApi.Contracts;

[ServiceContract]
public interface DokkanContract{
    [OperationContract]
    public Task<UserResponseDto> GetUserById(Guid userId, CancellationToken cancellationToken);

    [OperationContract]
    public Task<UserResponseDto> CreateUser(UserCreateRequestDto user, CancellationToken cancellationToken);
}