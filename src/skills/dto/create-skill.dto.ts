import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateSkillDto {
    @IsNotEmpty({ message: "Tên kỹ năng không được để trống" })
    @IsString({ message: "Tên kỹ năng phải là chữ" })
    name: string;

    @IsOptional()
    @IsString({ message: "Mô tả phải là chữ" })
    description: string;
}

