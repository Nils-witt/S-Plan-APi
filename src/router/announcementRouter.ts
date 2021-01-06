/*
 * Copyright (c) 2021 Nils Witt.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {TimeTable} from "../classes/TimeTable";

import express from 'express';
import {User} from '../classes/User';
import {PushNotifications} from '../classes/PushNotifications';
import {ApiGlobal} from "../types/global";
import {Course} from "../classes/Course";
import {Announcement} from "../classes/Announcement";

declare const global: ApiGlobal;

export let router = express.Router();

//TODO add jDoc
router.use((req, res, next) => {
    if (req.decoded.permissions.announcements) {
        next();
        return;
    }
    return res.sendStatus(401);
});

/**
 * Lists all Announcements
 * @route POST /announcements/
 * @group Announcements - Management functions for Announcements
 * @param {Announcement.model} Announcement.body.required
 * @returns {object} 200 - Success
 * @returns {Error} 401 - Wrong Credentials
 * @security JWT
 */
router.post('/', async (req, res) => {
    let body = req.body;
    try {
        let course = await TimeTable.getCourseByFields(body["course"]["subject"], body["course"]["grade"], body["course"]["group"])
        console.log(course);

        if (!req.decoded.admin) {
            if (!req.user.isTeacherOf(course)) {
                return res.sendStatus(401);
            }
        }

        let announcement = new Announcement(course, req.decoded.userId, req.decoded.userId, body["content"], body["date"], null);
        await announcement.create();

        let devices = await User.getStudentDevicesByCourse(course);
        let push = new PushNotifications();
        await push.sendBulk(devices, "Aushang: " + announcement.course.subject, " Hinzugefügt: " + announcement.content + " Datum: " + announcement.date);

        res.sendStatus(200);
    } catch (e) {
        console.log(e);
        global.logger.log({
            level: 'error',
            label: 'announcementsRouter',
            message: 'Error while processing request ' + JSON.stringify(e)
        });

        res.sendStatus(500);
    }
});

/**
 * Lists all Announcements
 * @route GET /announcements/
 * @group Announcements - Management functions for Announcements
 * @returns {Array.<Announcement>} 200
 * @returns {Error} 401 - Wrong Credentials
 * @security JWT
 */
router.get('/', async (req, res) => {

    await res.json(await Announcement.getAll());
});

/**
 * Updates Announcement {id}
 * @route PUT /announcements/id/{id}
 * @group Announcements - Management functions for Announcements
 * @returns {Error} 200 - Success
 * @returns {Error} 401 - Wrong Credentials
 * @security JWT
 */
router.put('/id/:id', async (req, res) => {
    if (!req.decoded.permissions.announcementsAdmin) {
        return res.sendStatus(401);
    }
    let body = req.body;
    let id: number = parseInt(req.params.id);
    let announcement: Announcement = await Announcement.getById(id);

    announcement.course = new Course(body["course"]["grade"], body["course"]["subject"], body["course"]["group"], false);
    announcement.content = body["content"];
    announcement.date = body["date"];

    await announcement.update();

    let devices = await User.getStudentDevicesByCourse(announcement.course);
    let push = new PushNotifications();
    await push.sendBulk(devices, "Aushang: " + announcement.course.subject, " Geändert: " + announcement.content + " Datum: " + announcement.date);

    res.sendStatus(200);
});

/**
 * Returns Announcement {id}
 * @route GET /announcements/id/{id}
 * @group Announcements - Management functions for Announcements
 * @returns {Error} 200 - Success
 * @returns {Error} 401 - Wrong Credentials
 * @security JWT
 */
router.get('/id/:id', async (req, res) => {
    let id = parseInt(req.params.id);
    let announcement = await Announcement.getById(id);
    res.json(announcement)
});

/**
 * Deletes Announcement {id}
 * @route DELETE /announcements/id/{id}
 * @group Announcements - Management functions for Announcements
 * @returns {Error} 200 - Success
 * @returns {Error} 401 - Wrong Credentials
 * @security JWT
 */
router.delete('/id/:id', async (req, res) => {
    if (!req.decoded.permissions.announcementsAdmin) {
        return res.sendStatus(401);
    }
    try {
        let id = parseInt(req.params.id);
        let announcement: Announcement = await Announcement.getById(id);

        if (!req.decoded.admin) {
            if (!req.user.isTeacherOf(announcement.course)) {
                return res.sendStatus(401);
            }
        }

        await announcement.delete();
        let devices = await User.getStudentDevicesByCourse(announcement.course);
        let push = new PushNotifications();
        await push.sendBulk(devices, "Aushang: " + announcement.course.subject, " Entfernt Datum: " + announcement.date);

        res.sendStatus(200);
    } catch (e) {
        //TODO add logger
        console.log(e);
        res.sendStatus(500);
    }
});