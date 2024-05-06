import { Request, Response, Router } from "express";
import { data } from "../data"
import fs from 'fs';
import DataModel from "../../model";

// Create a new instance of the Express Router
const UserRouter = Router();

// @route    POST api/users/signup
// @desc     Register user
// @access   Public
UserRouter.get(
  "/:address",
  async (req: Request, res: Response) => {
    console.log('here')
    try {
      const { address } = req.params;
      const query = { address: { $regex: new RegExp(address, 'i') } };
      console.log(query)

      const result = await DataModel.findOne(query);
      return res.json({ claimableAmount: result?.claimableAmount ?? 0, winnerState: result?.winnerState ?? false })
    } catch (error: any) {
      console.error(error);
      return res.status(500).send({ error });
    }
  }
);

export default UserRouter;
