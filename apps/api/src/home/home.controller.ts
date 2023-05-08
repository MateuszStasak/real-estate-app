import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Query,
    UnauthorizedException
} from '@nestjs/common';
import { HomeService } from "./home.service";
import {
    CreateHomeDto,
    FilteredHomesResponse,
    HomeResponseDto,
    InquireDto,
    UpdateHomeDto
} from "./dtos/home.dto";
import {
    User,
    UserInfo
} from "../user/decorators/user.decorator";
import { Roles } from "../decorators/roles.decorator";
import { UserType } from "@prisma/client";

@Controller('/home')
export class HomeController {

    constructor(private readonly homeService: HomeService) {}

    @Get()
    getHomes(@Query() query: FilteredHomesResponse): Promise<HomeResponseDto[]> {

        const { city, minPrice, maxPrice, propertyType } = query;

        const filters = {
            city,
            price: {
                gte: minPrice,
                lte: maxPrice,
            },
            propertyType,
        }

        return this.homeService.getHomes(filters);
    }

    @Get('/:id')
    getHome(@Param('id') id: string) {
       return this.homeService.getHomeById(id);
    }

    @Roles(UserType.REALTOR, UserType.ADMIN)
    @Post()
    createHome(@Body() body: CreateHomeDto, @User() user: UserInfo) {
        return this.homeService.createHome(body, user.id);
    }

    @Roles(UserType.REALTOR, UserType.ADMIN)
    @Put('/:id')
    async updateHome(@Param('id') id: string, @Body() body: UpdateHomeDto, @User() user: UserInfo) {
        const realtor = await this.homeService.getRealtorByHomeId(id);

        if (realtor.id !== user.id) {
            throw new UnauthorizedException();
        }

        return this.homeService.updateHomeById(id, body);
    }

    @Roles(UserType.REALTOR, UserType.ADMIN)
    @Delete('/:id')
    async deleteHome(@Param('id') id: string, @User() user: UserInfo) {
        const realtor = await this.homeService.getRealtorByHomeId(id);

        if (realtor.id !== user.id) {
            throw new UnauthorizedException();
        }

        return this.homeService.deleteHomeById(id);
    }

    @Roles(UserType.BUYER)
    @Post('/:id/inquire')
    inquire(@Param('id') homeId: string, @User() user: UserInfo, @Body() { message }: InquireDto) {
        return this.homeService.inquire(homeId, user, message);
    }

    @Roles(UserType.REALTOR)
    @Get('/:id/messages')
    async getHomeMessages(@Param('id') homeId: string, @User() user: UserInfo) {
        const realtor = await this.homeService.getRealtorByHomeId(homeId);

        if (realtor.id !== user.id) {
            throw new UnauthorizedException();
        }

        return this.homeService.getMessagesByHome(homeId);
    }
}
