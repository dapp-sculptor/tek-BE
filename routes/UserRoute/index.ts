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
      for (let i = 0; i < data.length; i++) {
        if (data[i].address.toLowerCase() == address.toLowerCase()) {
          console.log(data[i].claimableAmount)
          return res.json(data[i].claimableAmount)
        }
      }
      return res.json(0)
    } catch (error: any) {
      console.error(error);
      return res.status(500).send({ error });
    }
  }
);

export default UserRouter;
