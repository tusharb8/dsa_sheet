import { Controller, Post, UploadedFile, UseInterceptors, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN')
@ApiTags('Upload')
@ApiBearerAuth()
@Controller('upload')
export class UploadController {
  constructor(private readonly service: UploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload Excel sheet', description: 'Uploads an Excel file to seed topics, resources, and problems. Requires ADMIN role.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary', description: 'Excel file (.xlsx/.xls)' } } } })
  @ApiResponse({ status: 201, description: 'Excel processed successfully.' })
  async upload(@UploadedFile() file: Express.Multer.File) {
    return this.service.process(file);
  }
}
