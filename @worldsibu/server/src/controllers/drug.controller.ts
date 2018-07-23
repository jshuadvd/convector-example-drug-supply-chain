import { Router, Request, Response } from 'express';
import { Helper } from '../utils';
import { Drug, Models, DrugController } from '../utils';
import * as crypto from 'crypto';
import { Users } from '../utils/users';

const router: Router = Router();

/** Get all the drugs! */
router.get('/', async (req: Request, res: Response) => {
  console.log('get');
  const channel = Helper.channel;
  // _drug is equivalent to the name of your chaincode
  // it gets generated on the world state
  const dbName = channel + '_drug';
  const viewUrl = '_design/drugs/_view/all';

  const queryOptions = { startKey: [''], endKey: [''] };

  try {
    const result = <Drug[]>(await Drug.query(Drug, dbName, viewUrl, queryOptions));

    res.send(await Promise.all(result.map(Models.formatDrug)));
  } catch (err) {
    console.log(err);
    if (err.code === 'EDOCMISSING') {
      res.send([]);
    } else {
      res.status(500).send(err);
    }
  }

});


router.get('/users', (req: Request, res: Response) => {
  const list = [
    { org: 'org1', user: 'user1', name: 'Manufacturer Acme', },
    { org: 'org1', user: 'user2', name: 'Manufacturer W. White' },
    { org: 'org1', user: 'user3', name: 'Manufacturer Gus' },
    { org: 'org2', user: 'user1', name: 'Springfield General Hospital' },
    { org: 'org2', user: 'user2', name: 'Arkham Asylum' },
    { org: 'org2', user: 'user3', name: 'Mercy Hospital' }];

  res.send(Users.GetUsers(list));
});

/** Transfer the holder of the drug in the value chain. */
router.post('/:id/transfer/', async (req: Request, res: Response) => {
  let { id } = req.params;
  let { to, reportHash, reportUrl } = req.body;

  try {
    let result = await DrugController.transfer(id, to, reportHash, reportUrl);

    const updatedDrug = await Drug.getOne(id);
    res.send(updatedDrug);

  } catch (err) {
    console.log('err');
    console.log(err);
    res.status(500).send(err);
  }
});

/** Insert one drug. */
router.post('/', async (req: Request, res: Response) => {
  let { id, name } = req.body;

  let result;
  const fId = id || crypto.randomBytes(16).toString('hex');

  try {
    result = await DrugController.create(id, name);

    const updatedDrug = await Drug.getOne(fId);

    res.send(updatedDrug);

  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

export const DrugCtrl: Router = router;