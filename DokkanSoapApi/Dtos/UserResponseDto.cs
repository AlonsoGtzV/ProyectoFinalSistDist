using System.Runtime.Serialization;

namespace DokkanSoapApi.Dtos;

[DataContract]
public class UserResponseDto{
    [DataMember]
    public Guid Id {get; set;}
    [DataMember]
    public string username {get; set;} = null;
    [DataMember]
    public int level {get; set;}
    [DataMember]
    public int powerLevel {get; set;}
}