import { UserType } from "@prisma/client";
import {
    IsEmail, IsEnum,
    IsNotEmpty, IsOptional,
    IsString,
    IsStrongPassword,
    Matches,
    MinLength
} from "class-validator";

export class SignupDto {

    @IsNotEmpty()
    @IsString()
    name: string;

    @Matches(/(?<!\w)(\(?(\+|00)?48\)?)?[ -]?\d{3}[ -]?\d{3}[ -]?\d{3}(?!\w)/, {message: 'Phone number must be a valid phone number'})
    phone: string;

    @IsEmail()
    email: string;

    @MinLength(6)
    @IsStrongPassword()
    password: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    productKey?: string;
}

export class SigninDto {

    @IsEmail()
    email: string;

    @IsString()
    password: string;
}

export class GenerateProductKeyDto {

    @IsEmail()
    email: string;

    @IsEnum(UserType)
    userType: UserType;
}