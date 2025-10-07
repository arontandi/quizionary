import { Controller, Post, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('verify')
    async verifyToken(@Headers('Authorization') token: string) {
        return this.authService.verifyToken(token);
    }
}
