using System.ComponentModel.DataAnnotations;

namespace Api.DTOs.Requests;

public class LoginRequestDto
{
    [MinLength(3)] [Required]
    public string UserName { get; set; } = string.Empty;
    
    [MinLength(6)] [Required]
    public string Password { get; set; } = string.Empty;
}