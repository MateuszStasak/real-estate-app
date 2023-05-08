import { Test, TestingModule } from '@nestjs/testing';
import {
  homeSelect,
  HomeService
} from './home.service';
import { PrismaService } from "../prisma/prisma.service";
import { PropertyType } from "@prisma/client";
import { NotFoundException } from "@nestjs/common";

const mockGetHomes = [
  {
    id: '232',
    address: 'street 1',
    city: 'Warsaw',
    price: '1500000',
    property_type: PropertyType.RESIDENTIAL,
    image: 'img1',
    number_of_bedrooms: 3,
    number_of_bathrooms: 2,
    images: [
        {
          url: 'src1',
        },
    ]
  }
];

const mockHome = {
  id: '232',
  address: 'street 1',
  city: 'Warsaw',
  price: '1500000',
  property_type: PropertyType.RESIDENTIAL,
  image: 'img1',
  number_of_bedrooms: 3,
  number_of_bathrooms: 2,
};

const mockImages = [
  {
    id: '1',
    url: 'src1',
  },
  {
    id: '2',
    url: 'src2',
  }
];

describe('HomeService', () => {
  let homeService: HomeService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HomeService, {
        provide: PrismaService,
        useValue: {
          home: {
            findMany: jest.fn().mockReturnValue(mockGetHomes),
            create: jest.fn().mockReturnValue(mockHome),
          },
          image: {
            createMany: jest.fn().mockReturnValue(mockImages),
          }
        }
      }],
    }).compile();

    homeService = module.get<HomeService>(HomeService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(homeService).toBeDefined();
  });

  describe('getHomes', () => {
    const filters = {
      city: 'Warsaw',
      price: {
        gte: 1000000,
        lte: 1500000,
      },
      propertyType: PropertyType.RESIDENTIAL,
    };

    it('should call prisma home.findMany with correct parameters', async () => {
      const mockPrismaFindManyHomes = jest.fn().mockReturnValue(mockGetHomes);
      jest
          .spyOn(prismaService.home, 'findMany')
          .mockImplementation(mockPrismaFindManyHomes);

      await homeService.getHomes(filters);

      expect(mockPrismaFindManyHomes).toBeCalledWith(
          {
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
          }
      )
    });

    it('should throw not found exception if not homes are found', async () => {
      const mockPrismaFindManyHomes = jest.fn().mockReturnValue([]);
      jest
          .spyOn(prismaService.home, 'findMany')
          .mockImplementation(mockPrismaFindManyHomes);

      await expect(homeService.getHomes(filters)).rejects.toThrowError(NotFoundException);
    });
  });

  describe('createHome', () => {
    const mockCreateHomeParams = {
      address: '111 B',
      numberOfBathrooms: 3,
      numberOfBedrooms: 2,
      city: 'Warsaw',
      price: 150000,
      landSize: 300,
      propertyType: PropertyType.RESIDENTIAL,
      images: [
        {
          url: 'src1',
        },
      ]
    }

    it('should call prisma home.create with the correct payload', async () => {
      const mockCreateHome = jest.fn().mockReturnValue(mockHome);

      jest
          .spyOn(prismaService.home, 'create')
          .mockImplementation(mockCreateHome);

      await homeService.createHome(mockCreateHomeParams, '5');

      expect(mockCreateHome).toBeCalledWith({
        data: {
          address: '111 B',
          number_of_bathrooms: 3,
          number_of_bedrooms: 2,
          city: 'Warsaw',
          price: 150000,
          land_size: 300,
          property_type: PropertyType.RESIDENTIAL,
          realtor_id: '5',
        }
      });
    });

    it('should call prisma image.createMany with the correct payload', async () => {
      const mockCreateManyImages = jest.fn().mockReturnValue(mockImages);

      jest
          .spyOn(prismaService.image, 'createMany')
          .mockImplementation(mockCreateManyImages);

      await homeService.createHome(mockCreateHomeParams, '5');

      expect(mockCreateManyImages).toBeCalledWith({
          data: [
            {
              url: 'src1',
              home_id: '232',
            }
          ],
      });
    });
  });
});
