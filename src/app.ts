/*
 * Copyright (c) 2021 Nils Witt.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */


import {Starter} from "./startEnviroment";

(async () => {
    try {
        await Starter.full();
    }catch (e) {
        console.log("Start errored")
        process.exit(1);
    }
})();




//TODO move to router
/*
app.get('/telegram/confirm/:token', async (req: Request, res: Response) => {
    let token = req.params.token;

    let tgId: number = 0;

    try {
        tgId = await Telegram.validateRequestToken(token);
    } catch (e) {
        res.sendStatus(200);
        return;
    }

    try {
        let device = new Device(DeviceType.TELEGRAM, null, req.user.id, "", tgId.toString())
        await req.user.addDevice(device);
        await Telegram.revokeRequest(token);
        if (global.pushNotifications.pushTelegram) {
            await global.pushNotifications.pushTelegram.sendPush(tgId, "Connected to user " + req.user.username);
        }
        res.sendStatus(200);
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
});
*/