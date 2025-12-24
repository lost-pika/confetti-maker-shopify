// routes/confetti-api.js
import express from 'express';
import { shopify } from '../shopify.server.js';

const router = express.Router();

/**
 * GET /api/confetti/active
 * Retrieve active confetti for storefront
 */
router.get('/api/confetti/active', async (req, res) => {
  try {
    const { shop } = req.query;

    if (!shop) {
      return res.status(400).json({ error: 'Shop parameter required' });
    }

    // Fetch from your database
    const activeConfetti = await getActiveConfettiFromDB(shop);

    res.json({
      success: true,
      data: activeConfetti,
    });
  } catch (error) {
    console.error('Error fetching active confetti:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/confetti/activate
 * Activate a confetti config on storefront
 */
router.post('/api/confetti/activate', async (req, res) => {
  try {
    const { shopId, confettiId, config, triggerEvent } = req.body;

    // Save to database
    const result = await activateConfetti(shopId, {
      id: confettiId,
      config,
      triggerEvent,
      activatedAt: new Date(),
    });

    // Update Shopify metafield
    await updateShopifyMetafield(shopId, config, triggerEvent);

    res.json({
      success: true,
      message: 'Confetti activated',
      data: result,
    });
  } catch (error) {
    console.error('Error activating confetti:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/confetti/deactivate
 * Deactivate confetti
 */
router.post('/api/confetti/deactivate', async (req, res) => {
  try {
    const { shopId, confettiId } = req.body;

    await deactivateConfetti(shopId, confettiId);
    await clearShopifyMetafield(shopId);

    res.json({
      success: true,
      message: 'Confetti deactivated',
    });
  } catch (error) {
    console.error('Error deactivating confetti:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/confetti/trigger-events
 * List available trigger events
 */
router.get('/api/confetti/trigger-events', (req, res) => {
  const events = [
    {
      id: 'page_load',
      label: 'Page Load',
      description: 'Trigger on storefront page load',
    },
    {
      id: 'customer_login',
      label: 'Customer Login',
      description: 'Trigger when customer logs in',
    },
    {
      id: 'new_year',
      label: 'New Year (Jan 1)',
      description: 'Trigger every New Year',
    },
    {
      id: 'purchase_complete',
      label: 'Purchase Complete',
      description: 'Trigger on thank you page after purchase',
    },
    {
      id: 'custom_date',
      label: 'Custom Date',
      description: 'Trigger on specific date (MM-DD)',
    },
  ];

  res.json({ success: true, data: events });
});

/**
 * Helper: Update Shopify metafield with active confetti
 */
async function updateShopifyMetafield(shopId, config, triggerEvent) {
  const shop = await getShopFromDB(shopId);

  const mutation = `
    mutation SetMetafield($input: PrivateMetafieldsSetInput!) {
      privateMetafieldsSet(input: $input) {
        privateMetafields {
          namespace
          key
          value
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables = {
    input: {
      namespace: 'confetti_maker',
      key: 'active_config',
      ownerId: shop.shopifyShopId,
      value: JSON.stringify(config),
    },
  };

  // Make GraphQL call to Shopify
  const response = await shopify.client(shop.accessToken).query({
    data: {
      query: mutation,
      variables,
    },
  });

  return response;
}

/**
 * Helper: Clear metafield
 */
async function clearShopifyMetafield(shopId) {
  const shop = await getShopFromDB(shopId);

  const mutation = `
    mutation DeleteMetafield($input: PrivateMetafieldsDeleteInput!) {
      privateMetafieldsDelete(input: $input) {
        deletedPrivateMetafields {
          namespace
          key
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables = {
    input: {
      namespace: 'confetti_maker',
      key: 'active_config',
      ownerId: shop.shopifyShopId,
    },
  };

  return await shopify.client(shop.accessToken).query({
    data: { query: mutation, variables },
  });
}

export default router;
