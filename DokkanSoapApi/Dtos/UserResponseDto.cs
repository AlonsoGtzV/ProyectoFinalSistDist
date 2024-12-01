using System.Runtime.Serialization;

namespace DokkanSoapApi.Dtos;

[DataContract]
public class UserResponseDto{
    [DataMember]
    public Guid Id {get; set;}
    [DataMember]
    public string username {get; set;} = null!;
    [DataMember]
    public string level {get; set;} =null!;
    [DataMember]
    public string powerLevel {get; set;} =null!;
}