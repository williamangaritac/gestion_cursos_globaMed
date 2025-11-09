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
import { ProgramsService } from './programs.service';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';
import { FilterProgramDto } from './dto/filter-program.dto';
import { ProgramResponseDto } from './dto/program-response.dto';
import { PaginatedResultDto } from '@/common/interfaces/paginated-result.interface';
import { Roles } from '@/common/decorators/roles.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { UserRole } from '@modules/users/domain/entities/user.entity';

@ApiTags('programs')
@Controller('programs')
export class ProgramsController {
  constructor(private readonly programsService: ProgramsService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new program (Admin/Instructor only)' })
  @ApiResponse({
    status: 201,
    description: 'Program successfully created',
    type: ProgramResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async create(@Body() createProgramDto: CreateProgramDto): Promise<ProgramResponseDto> {
    return this.programsService.create(createProgramDto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all programs with filters and pagination (Public)' })
  @ApiResponse({
    status: 200,
    description: 'List of programs',
    type: PaginatedResultDto<ProgramResponseDto>,
  })
  async findAll(
    @Query() filterDto: FilterProgramDto,
  ): Promise<PaginatedResultDto<ProgramResponseDto>> {
    return this.programsService.findAll(filterDto);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get program by ID (Public)' })
  @ApiParam({ name: 'id', description: 'Program ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Program found',
    type: ProgramResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Program not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ProgramResponseDto> {
    return this.programsService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiOperation({ summary: 'Update program by ID (Admin/Instructor only)' })
  @ApiParam({ name: 'id', description: 'Program ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Program successfully updated',
    type: ProgramResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Program not found' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProgramDto: UpdateProgramDto,
  ): Promise<ProgramResponseDto> {
    return this.programsService.update(id, updateProgramDto);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft delete program by ID (Admin only)' })
  @ApiParam({ name: 'id', description: 'Program ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Program successfully deleted' })
  @ApiResponse({ status: 404, description: 'Program not found' })
  @ApiResponse({ status: 400, description: 'Cannot delete program with enrollments' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<{ message: string }> {
    return this.programsService.remove(id);
  }

  @Post(':id/publish')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Publish a draft program (Admin/Instructor only)' })
  @ApiParam({ name: 'id', description: 'Program ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Program successfully published',
    type: ProgramResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Program not found' })
  @ApiResponse({ status: 400, description: 'Only draft programs can be published' })
  async publish(@Param('id', ParseUUIDPipe) id: string): Promise<ProgramResponseDto> {
    return this.programsService.publish(id);
  }

  @Post(':id/activate')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate a published program (Admin only)' })
  @ApiParam({ name: 'id', description: 'Program ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Program successfully activated',
    type: ProgramResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Program not found' })
  @ApiResponse({ status: 400, description: 'Only published programs can be activated' })
  async activate(@Param('id', ParseUUIDPipe) id: string): Promise<ProgramResponseDto> {
    return this.programsService.activate(id);
  }

  @Post(':id/archive')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Archive a program (Admin only)' })
  @ApiParam({ name: 'id', description: 'Program ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Program successfully archived',
    type: ProgramResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Program not found' })
  async archive(@Param('id', ParseUUIDPipe) id: string): Promise<ProgramResponseDto> {
    return this.programsService.archive(id);
  }
}

