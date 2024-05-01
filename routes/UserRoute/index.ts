import { Request, Response, Router } from "express";
import { data } from "../data"
import fs from 'fs';

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
      console.log(address)
      data.map((item: { address: string, count: number, claimableAmount: number }) => {
        if (item.address == address) {
          console.log(item.claimableAmount)
          res.json(item.claimableAmount)
        }
      })

    } catch (error: any) {
      console.error(error);
      return res.status(500).send({ error });
    }
  }
);

export default UserRouter;
