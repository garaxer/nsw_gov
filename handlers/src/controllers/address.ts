import { AddressService } from '../services/addressService';
import { LocationInfo } from '../types/domain';

export class AddressController {
  private addressService: AddressService;

  constructor() {
    this.addressService = new AddressService();
  }

  /**
   * Handle address lookup request
   */
  async handleAddressLookup(query: string): Promise<LocationInfo> {
    try {
      const result = await this.addressService.lookupAddress(query.trim());
      console.log('Address lookup completed successfully');
      return result;
    } catch (error) {
      console.error('Failed to lookup address:', error);
      throw error;
    }
  }
}