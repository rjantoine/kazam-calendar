import {v4 as uuidv4} from "uuid";
import PatchEvent, {set} from 'part:@sanity/form-builder/patch-event'
import React from 'react'
import { withDocument } from "part:@sanity/form-builder"
import {Button, TextInput} from "@sanity/ui";

const GenerateLink = React.forwardRef(({value, onChange, document}) => <>
    {!value && <Button onClick={() => onChange(PatchEvent.from(set(uuidv4())))} style={{fontSize: '1.2em'}}>Generate Link</Button>}
    { value && <TextInput disabled value={`https://kazam-calendar.vercel.com/api/cal/${document.slug.current}/${value}`} /> }
</>)

export default {
    title: 'Shared Calendar',
    name: 'sharedCalendar',
    type: 'document',
    fields: [
        { name: 'title', type: 'string'},
        { name: 'slug', type: 'slug', description: 'This will be part of the new calendar web address, so keep it short, simple, but pertinent. Clicking [Generate] will give a url friendly version of the title.', options: {source: 'title'}},
        {
            name: 'calendarLink',
            type: 'string',
            description: 'This will not be shared, you can put your private calendar link here.'
        },
        {
            name: 'shareLinks',
            type: 'array',
            of: [{
                name: 'shareLink',
                type: 'object',
                fields: [
                    { name: 'name', type: 'string', description: 'Who is this code for? This is for your own reference.'},
                    {
                        name: 'link',
                        title: 'Share Link',
                        type: 'string',
                        description: "This will be part the second part of the calendar address. Best to just hit [Generate] to create a random code. You don't want it to be guessable.",
                        inputComponent: withDocument(GenerateLink),
                    },
                ]
            }]
        },
    ]
}