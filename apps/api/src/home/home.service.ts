import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from "../prisma/prisma.service";
import {
    HomeResponseDto
} from "./dtos/home.dto";
import { PropertyType } from "@prisma/client";
import { UserInfo } from "../user/decorators/user.decorator";

interface GetHomesParam {
    city?: string;
    price?: {
        gte?: number;
        lte?: number;
    };
    propertyType?: PropertyType;
}

type Image = {
    url: string
}

interface CreateHomeParams {
    address: string;
    numberOfBedrooms: number;
    numberOfBathrooms: number;
    city: string;
    price: number;
    landSize: number;
    propertyType: PropertyType;
    images: Image[];
}

interface UpdateHomeParams {
    address?: string;
    numberOfBedrooms?: number;
    numberOfBathrooms?: number;
    city?: string;
    price?: number;
    landSize?: number;
    propertyType?: PropertyType;
}

export const homeSelect = {
    id: true,
    address: true,
    city: true,
    price: true,
    property_type: true,
    number_of_bathrooms: true,
    number_of_bedrooms: true,
};

@Injectable()
export class HomeService {

    constructor(private readonly prismaService: PrismaService) {}

    async getHomes(filters: GetHomesParam): Promise<HomeResponseDto[]> {
        const homes = await this.prismaService.home.findMany({
            where: filters,
            select: {
                ...homeSelect,
                images: {
                    select: {
                        url: true,
                    },
                    take: 1,
                },
            },
        });

        if (!homes.length) {
            throw new NotFoundException();
        }

        return homes.map(home => {
            const fetchHomes = {
                ...home,
                image: home.images[0].url
            };
            delete fetchHomes.images;
            return new HomeResponseDto(fetchHomes)
        });
    }

    async getHomeById(id: string) {
        const home = await this.prismaService.home.findUnique({where: { id }});

        if (!home) {
        throw new NotFoundException();
        }

        return new HomeResponseDto(home);
    }

    async createHome({ address, numberOfBedrooms, numberOfBathrooms, city, price, landSize, propertyType, images }: CreateHomeParams, userId: string) {
        const home = await this.prismaService.home.create({
            data: {
                address,
                number_of_bathrooms: numberOfBathrooms,
                number_of_bedrooms: numberOfBedrooms,
                city,
                price,
                land_size: landSize,
                property_type: propertyType,
                realtor_id: userId,
            }
        });

        const homeImages = images.map(image => {
            return {
                ...image,
                home_id: home.id
            };
        });

        await this.prismaService.image.createMany({ data: homeImages });

        return new HomeResponseDto(home);
    }

    async updateHomeById(id: string, data: UpdateHomeParams) {
        const home = await this.prismaService.home.findUnique({where: { id }});

        if (!home) {
            throw new NotFoundException();
        }

        const updatedHome = await this.prismaService.home.update({
            where: {
                id,
            },
            data,
        });

        return new HomeResponseDto(updatedHome);
    }

    async deleteHomeById(id: string) {
        await this.prismaService.image.deleteMany({ where: { home_id: id } });
        await this.prismaService.home.delete({ where: { id }});
    }

    async getRealtorByHomeId(id: string) {
        const home = await this.prismaService.home.findUnique({ where: { id }, select: { realtor: { select: { name: true, id: true, email: true, phone: true } } } });

        if(!home) {
            throw new NotFoundException();
        }

        return home.realtor;
    }

    async inquire(homeId: string, buyer: UserInfo, message: string) {
        const realtor = await this.getRealtorByHomeId(homeId);

        return await this.prismaService.message.create({
            data: {
                realtor_id: realtor.id,
                buyer_id: buyer.id,
                home_id: homeId,
                message,
            }
        });
    }

    async getMessagesByHome(homeId: string) {
        return await this.prismaService.message.findMany({
            where: {
                home_id: homeId,
            },
            select: {
                message: true,
                buyer: {
                    select: {
                        name: true,
                        id: true,
                        email: true,
                        phone: true,
                    }
                }
            }
        });
    }
}
