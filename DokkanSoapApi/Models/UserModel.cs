namespace DokkanSoapApi.Models;

public class UserModel{
    public Guid Id {get; set;}
    public string username {get; set;} = null;
    public int level {get; set;}
    public int powerLevel {get; set;}
}