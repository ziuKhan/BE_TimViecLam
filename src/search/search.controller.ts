import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { Public, ResponseMessage } from '../decorator/customize';
import { CommonQueryDto } from '../dto/common-query.dto';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('suggest')
  @Public()
  @ResponseMessage('Suggest successfully')
  suggest(@Query() query: CommonQueryDto) { 
    const { page, pageSize, search, filter } = query;
    return this.searchService.suggest(+page, +pageSize, search, filter);
  }

  @Get()
  @Public()
  @ResponseMessage('Search successfully')
  search(@Query() query: CommonQueryDto) {
    const { page, pageSize, search, filter } = query;
    return this.searchService.search(+page, +pageSize, search, filter);
  }
}
