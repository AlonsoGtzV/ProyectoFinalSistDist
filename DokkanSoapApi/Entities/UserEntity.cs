namespace DokkanSoapApi.Infrastructure.Entities;

public class UserEntity{
    public Guid Id {get; set;}
    public string username {get; set;} = null;
    public int level {get; set;}
    public int powerLevel {get; set;}

}