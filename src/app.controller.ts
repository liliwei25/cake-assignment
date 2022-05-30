import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { AppService } from './app.service';
import * as blocks from './200.json';
import { Block } from './schemas/block.schema';
import { Transaction } from './schemas/transaction.schema';

@Controller('/api/blocks')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('load')
  async loadData(): Promise<string> {
    for (const block of blocks) {
      await this.appService.processBlock(block);
    }
    return 'loaded';
  }

  @Get('reverse/:hash')
  async reverseBlock(@Param('hash') hash: string): Promise<string> {
    await this.appService.unProcessBlock(hash);
    return `removed ${hash}`;
  }

  @Get()
  async getBlocks(@Query('maxHeight') maxHeight?: number): Promise<Block[]> {
    return this.appService.findByMaxHeight(maxHeight);
  }

  @Get(':hash')
  async getBlockByHash(@Param('hash') hash: string): Promise<Block> {
    return this.appService.findBlockByHash(hash);
  }

  @Get(':height/transactions')
  getBlockTransactions(
    @Param('height', ParseIntPipe) height: number,
  ): Promise<Transaction[]> {
    return this.appService.findTransactionsByBlockHeight(height);
  }

  @Get('address/:address/transactions')
  async getAddressTransactions(
    @Param('address') address: string,
  ): Promise<Transaction[]> {
    return this.appService.findTransactionsByAddress(address);
  }
}
