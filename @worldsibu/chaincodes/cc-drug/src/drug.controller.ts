import * as yup from 'yup';
import {
  Controller,
  ConvectorController,
  Invokable,
  Param
} from '@worldsibu/convector-core-controller';

import { Drug } from './drug.model';

@Controller('drug')
export class DrugController extends ConvectorController {

  @Invokable()
  public async create(
    @Param(yup.string())
    id: string,
    @Param(yup.string())
    name: string
  ) {
    const exists = await Drug.getOne(id);

    if (exists.id === id) {
      throw new Error('There is already one drug with that unique id');
    }

    let drug = new Drug(id);
    drug.name = name;
    // Initialize the object!
    drug.createdBy = this.sender;
    drug.modifiedBy = this.sender;
    //drug.modified = drug.created;
    drug.holder = this.sender;

    await drug.save();
  }

  @Invokable()
  public async transfer(
    @Param(yup.string())
    drugId: string,
    @Param(yup.string())
    to: string,
    @Param(yup.string())
    reportHash,
    @Param(yup.string())
    reportUrl
  ) {
    const drug = await Drug.getOne(drugId);

    if (drug.holder !== this.sender) {
      throw new Error('The sender is the only user capable of transferring the drug in the value chain.');
    }

    // Change the holder.
    drug.holder = to;

    // Attach the report url. Since the user is the only responsible for the attachment, we don't check anything.
    drug.reports.push({
      url: reportUrl,
      hash: reportHash
    });

    // Update as modified
    drug.modifiedBy = this.sender;
   // drug.modified = Date.now;

    await drug.save();
  }
}