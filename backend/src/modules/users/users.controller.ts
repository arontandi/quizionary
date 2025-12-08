import { Controller, UsePipes, ValidationPipe, Headers, Post, Body, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthService } from '../auth/auth.service';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';

@Controller('users')
export class UsersController {
    constructor(private userService: UsersService, private authService: AuthService) { }

    @Post('me')
    @UsePipes(new ValidationPipe({ transform: true }))
    async createMe(@Headers('authorization') authorization: string, @Body() body: CreateUserProfileDto) {
        const decoded = await this.authService.verifyToken(authorization);

        await this.userService.createOrUpdateUserProfile({
            uid: decoded.uid,
            email: decoded.email ?? null,
            displayName: body.displayName,
        });

        return { ok: true };
    }

    @Delete('me')
    async deleteMe(@Headers('authorization') authorization: string) {
        const decoded = await this.authService.verifyToken(authorization);

        await this.userService.deleteUserProfile(decoded.uid);

        return { ok: true };
    }
}
