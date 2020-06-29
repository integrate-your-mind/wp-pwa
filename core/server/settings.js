import { normalize, schema } from 'normalizr';
// import { Lokka } from 'lokka';
// import { Transport } from 'lokka-transport-http';

// const client = new Lokka({
//   transport: new Transport('https://api.graph.cool/simple/v1/frontity-v1', {
//     headers: {
//       Authorization: `Bearer ${process.env.GRAPHQL_TOKEN}`,
//     },
//   }),
// });

const packageSchema = new schema.Entity(
  'packages',
  {},
  { idAttribute: pkg => pkg.namespace },
);

const settingSchema = new schema.Entity(
  'settings',
  { package: packageSchema },
  {
    idAttribute: setting => setting.package.namespace,
  },
);
const settingsSchema = [settingSchema];

// Fetch settings from the backend.
export default async ({ siteId }) => {
  try {
    const {
      data: { allSettings },
      // eslint-disable-next-line global-require, import/no-dynamic-require
    } = require(`../../sites/${siteId}`);
    // const { allSettings } = await client.query(`
    //   {
    //     allSettings(filter: {
    //       site: {
    //         siteId: "${siteId}"
    //       }
    //       active: true
    //     }) {
    //       site {
    //         url
    //         users {
    //           id
    //         }
    //       }
    //       package {
    //         name
    //         namespace
    //       }
    //       data
    //     }
    //   }
    // `);
    const { entities } = normalize(allSettings, settingsSchema);
    const settings = Object.entries(entities.settings).reduce(
      (obj, [namespace, setting]) => {
        obj[namespace] = setting.data;
        return obj;
      },
      {},
    );
    settings.generalSite = {
      url: Object.values(entities.settings)[0].site.url,
      userIds: Object.values(entities.settings)[0]
        .site.users.map(user => user.id)
        .join(', '),
    };
    const packages = Object.values(entities.packages)
      // Place 'theme' package in the last position.
      // This ensures Slot components to be rendered after Fills,
      // which is required for react-slot-fill's SSR to function properly.
      .sort((a, b) => {
        if (a.namespace === 'theme') return 1;
        if (b.namespace === 'theme') return -1;
        return 0;
      })
      .reduce((obj, { name, namespace }) => {
        obj[namespace] = name;
        return obj;
      }, {});
    return { settings, packages };
  } catch (error) {
    console.error(error);
    throw new Error(`Cannot retrieve settings for siteId: ${siteId}`);
  }
};
