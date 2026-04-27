using DataAccess;

namespace Api.DTOs;

public class UserDto
{
    public UserDto()
    {}
    
    public UserDto(User user)
    {
        Id =  user.Id;
        UserName = user.Username;
        Email = user.Email;
    }
    public Guid Id { get; set; }
    public string UserName { get; set; }
    public string Email { get; set; }
}