import { Request, Response, Router } from "express";
import fs from 'fs';

// Create a new instance of the Express Router
const UserRouter = Router();

// @route    POST api/users/signup
// @desc     Register user
// @access   Public
UserRouter.post(
  "/amount",
  async (req: Request, res: Response) => {
    try {
      const { address } = req.body;
      const data = JSON.parse(fs.readFileSync("result.json", `utf8`))
      if (address in data) {
        const info = data[address]
        res.json(info.amount)
      } else {
        console.error(`${address} => User not found`)
        return res.status(404).send({ error: 'User not found' })
      }

    } catch (error: any) {
      console.error(error);
      return res.status(500).send({ error });
    }
  }
);

export default UserRouter;
