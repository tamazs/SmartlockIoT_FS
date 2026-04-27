using System.ComponentModel.DataAnnotations;

namespace Api.DTOs.Requests;

public class RefreshTokenRequestDto
{
    [MinLength(3)] [Required]
    public string RefreshToken { get; set; }
}