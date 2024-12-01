using DokkanSoapApi.Dtos;
using DokkanSoapApi.Infrastructure.Entities;
using DokkanSoapApi.Models;

namespace DokkanSoapApi.Mappers;

public static class UserMapper{
    public static UserModel? ToModel(this UserEntity user){
        if(user is null){
            return null;
        }
        return new UserModel{
            Id = user.Id,
            username = user.username,
            level = user.level,
            powerLevel = user.powerLevel
        };

        
    }
    public static UserResponseDto ToDto(this UserModel user){
            return new UserResponseDto{
                Id = user.Id,
                username = user.username,
                level = user.level,
                powerLevel = user.powerLevel
            };
        }


    public static UserEntity ToEntity(this UserModel user){
        return new UserEntity{
            Id = user.Id,
            username = user.username,
            level = user.level,
            powerLevel = user.powerLevel

        };
    }

    public static UserModel ToModel(this UserCreateRequestDto user){
        return new UserModel{
            username = user.username,
            level = user.level,
            powerLevel = user.powerLevel
            };
    }
}