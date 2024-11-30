using Microsoft.EntityFrameworkCore;
using DokkanSoapApi.Infrastructure.Entities;

namespace DokkanSoapApi.Infrastructure;

public class RelationalDbContext : DbContext
{
    public RelationalDbContext(DbContextOptions<RelationalDbContext> options) : base(options)
    {
    }

    public DbSet<UserEntity> Users { get; set; }
}
