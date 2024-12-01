namespace DokkanSoapApi.Models;

public class UserModel{
    public Guid Id {get; set;}
    public string username {get; set;} = null!;
    public string level {get; set;}=null!;
    public string powerLevel {get; set;} =null!;
}