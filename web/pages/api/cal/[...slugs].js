import sanityClient from "@sanity/client"
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default async function handler(req, res) {
    const {slugs: [calendar, code]} = req.query

    const client = sanityClient({
        projectId: process.env.SANITY_PROJECT_ID,
        dataset: process.env.SANITY_DATASET,
        apiVersion: '2021-03-25', // use current UTC date - see "specifying API version"!
        token: process.env.SANITY_TOKEN, // or leave blank for unauthenticated usage
        useCdn: false, // `false` if you want to ensure fresh data
    })

    const sharedCalendar = await client.fetch('*[_type == "sharedCalendar" && slug.current == $calendar][0]{title, calendarLinks, "codes": array::compact(shareLinks[].link)}', {calendar}) || []

    if(!sharedCalendar.codes.includes(code)) res.status(500).send({message: 'Access denied.'})

    const iCals = await Promise.all(sharedCalendar.calendarLinks.map(async calendarLink => (await (await fetch(calendarLink)).text()).replaceAll('BEGIN:VCALENDAR', '').replaceAll('END:VCALENDAR', '')))
    res
        .setHeader('Content-Type', 'text/calendar; charset=utf-8')
        .setHeader('Content-Disposition', `inline;filename=${calendar}.ics`)
        .setHeader('cache-control', 'no-store, max-age=0, private, must-revalidate')
        .setHeader('x-content-type-options', 'nosniff')
        .setHeader('x-server-canonical-path','CalendarController#ical' )
        .status(200).send(`BEGIN:VCALENDAR\nX-PUBLISHED-TTL:PT15M\nREFRESH-INTERVAL;VALUE=DURATION:PT15M\nX-WR-CALNAME:${sharedCalendar.title}\nNAME:${sharedCalendar.title}\n`+iCals.join('')+'\nEND:VCALENDAR')


    // const calRes = await fetch('https://www.airbnb.ca/calendar/ical/705521568481310146.ics?s=aba76924042068194c60c7168ac7d8b4')
    // res.status(200).send()
}
