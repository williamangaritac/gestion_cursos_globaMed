import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { FilterEnrollmentDto } from './dto/filter-enrollment.dto';
import { EnrollmentResponseDto } from './dto/enrollment-response.dto';
import { PaginatedResultDto } from '@/common/interfaces/paginated-result.interface';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@modules/users/domain/entities/user.entity';

@ApiTags('enrollments')
@ApiBearerAuth('JWT-auth')
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.STUDENT)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new enrollment' })
  @ApiResponse({
    status: 201,
    description: 'Enrollment successfully created',
    type: EnrollmentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User or Program not found' })
  @ApiResponse({ status: 409, description: 'User already enrolled' })
  @ApiResponse({ status: 400, description: 'Program full or not active' })
  async create(@Body() createEnrollmentDto: CreateEnrollmentDto): Promise<EnrollmentResponseDto> {
    return this.enrollmentsService.create(createEnrollmentDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.STUDENT)
  @ApiOperation({ summary: 'Get all enrollments with filters and pagination' })
  @ApiResponse({
    status: 200,
    description: 'List of enrollments',
    type: PaginatedResultDto<EnrollmentResponseDto>,
  })
  async findAll(
    @Query() filterDto: FilterEnrollmentDto,
  ): Promise<PaginatedResultDto<EnrollmentResponseDto>> {
    return this.enrollmentsService.findAll(filterDto);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.STUDENT)
  @ApiOperation({ summary: 'Get enrollment by ID' })
  @ApiParam({ name: 'id', description: 'Enrollment ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Enrollment found',
    type: EnrollmentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Enrollment not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<EnrollmentResponseDto> {
    return this.enrollmentsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiOperation({ summary: 'Update enrollment by ID' })
  @ApiParam({ name: 'id', description: 'Enrollment ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Enrollment successfully updated',
    type: EnrollmentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Enrollment not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateEnrollmentDto: UpdateEnrollmentDto,
  ): Promise<EnrollmentResponseDto> {
    return this.enrollmentsService.update(id, updateEnrollmentDto);
  }

  @Patch(':id/progress/:progress')
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.STUDENT)
  @ApiOperation({ summary: 'Update enrollment progress' })
  @ApiParam({ name: 'id', description: 'Enrollment ID (UUID)' })
  @ApiParam({ name: 'progress', description: 'Progress value (0-100)' })
  @ApiResponse({
    status: 200,
    description: 'Progress successfully updated',
    type: EnrollmentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Enrollment not found' })
  @ApiResponse({ status: 400, description: 'Invalid progress value' })
  async updateProgress(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('progress') progress: number,
  ): Promise<EnrollmentResponseDto> {
    return this.enrollmentsService.updateProgress(id, Number(progress));
  }

  @Post(':id/complete')
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark enrollment as completed' })
  @ApiParam({ name: 'id', description: 'Enrollment ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Enrollment successfully completed',
    type: EnrollmentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Enrollment not found' })
  @ApiResponse({ status: 400, description: 'Enrollment already completed' })
  async complete(@Param('id', ParseUUIDPipe) id: string): Promise<EnrollmentResponseDto> {
    return this.enrollmentsService.complete(id);
  }

  @Post(':id/drop')
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.STUDENT)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Drop enrollment' })
  @ApiParam({ name: 'id', description: 'Enrollment ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Enrollment successfully dropped',
    type: EnrollmentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Enrollment not found' })
  @ApiResponse({ status: 400, description: 'Cannot drop completed enrollment' })
  async drop(@Param('id', ParseUUIDPipe) id: string): Promise<EnrollmentResponseDto> {
    return this.enrollmentsService.drop(id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete enrollment by ID (Admin only)' })
  @ApiParam({ name: 'id', description: 'Enrollment ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Enrollment successfully deleted' })
  @ApiResponse({ status: 404, description: 'Enrollment not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<{ message: string }> {
    return this.enrollmentsService.remove(id);
  }
}

