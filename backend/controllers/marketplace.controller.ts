import { Request, Response } from 'express';
import { APP_CONFIG } from '../../configuration/app.config';
import { ACTIVE_PROMO_CODES, CUISINE_CATEGORIES, DietaryType } from '../../configuration/constants';
import { restaurantRepository } from '../../database/repositories/restaurant.repository';

export class MarketplaceController {
  public getMetadata(_req: Request, res: Response): void {
    res.json({
      success: true,
      data: {
        cities: APP_CONFIG.SupportedCities,
        cuisines: CUISINE_CATEGORIES,
        promos: ACTIVE_PROMO_CODES,
        collections: restaurantRepository.getCollections(),
      },
    });
  }

  public listRestaurants(req: Request, res: Response): void {
    const { search, cuisine, mode, pureVeg, minRating, fastDelivery, sortBy } = req.query;

    const restaurants = restaurantRepository.findAll({
      search: typeof search === 'string' ? search : undefined,
      cuisine: typeof cuisine === 'string' ? cuisine : undefined,
      mode: mode === 'DINING_OUT' ? 'DINING_OUT' : mode === 'DELIVERY' ? 'DELIVERY' : undefined,
      pureVegOnly: pureVeg === 'true',
      minRating: typeof minRating === 'string' ? parseFloat(minRating) : undefined,
      fastDeliveryOnly: fastDelivery === 'true',
      sortBy:
        sortBy === 'DELIVERY_TIME' ||
        sortBy === 'COST_LOW_TO_HIGH' ||
        sortBy === 'COST_HIGH_TO_LOW' ||
        sortBy === 'RATING'
          ? sortBy
          : 'RATING',
    });

    res.json({
      success: true,
      data: restaurants,
      meta: {
        total: restaurants.length,
      },
    });
  }

  public getRestaurantDetails(req: Request, res: Response): void {
    const { id } = req.params;
    const restaurant = restaurantRepository.findById(id);
    if (!restaurant) {
      res.status(404).json({
        success: false,
        error: 'Restaurant not found',
      });
      return;
    }

    const menu = restaurantRepository.getMenuByRestaurantId(id);
    const reviews = restaurantRepository.getReviews(id);

    res.json({
      success: true,
      data: {
        restaurant,
        menu,
        reviews,
      },
    });
  }

  public createMenuItem(req: Request, res: Response): void {
    const { id } = req.params;
    const restaurant = restaurantRepository.findById(id);
    if (!restaurant) {
      res.status(404).json({ success: false, error: 'Restaurant not found' });
      return;
    }

    const { name, description, category, price, dietary, isBestseller, prepTimeMinutes, calories } = req.body;
    if (!name || !category || typeof price !== 'number' || price <= 0) {
      res.status(400).json({ success: false, error: 'Valid dish name, category, and price are required' });
      return;
    }

    const created = restaurantRepository.createMenuItem({
      restaurantId: id,
      name: String(name).trim(),
      description: String(description || 'Chef special crafted fresh to order.').trim(),
      category: String(category).trim(),
      price: Math.round(price),
      dietary:
        dietary === DietaryType.NON_VEG
          ? DietaryType.NON_VEG
          : dietary === DietaryType.EGG
            ? DietaryType.EGG
            : DietaryType.VEG,
      isBestseller: Boolean(isBestseller),
      prepTimeMinutes: Number(prepTimeMinutes) || 15,
      calories: Number(calories) || 550,
      available: true,
    });

    res.status(201).json({
      success: true,
      data: created,
    });
  }

  public toggleMenuAvailability(req: Request, res: Response): void {
    const { itemId } = req.params;
    const updated = restaurantRepository.toggleMenuItemAvailability(itemId);
    if (!updated) {
      res.status(404).json({ success: false, error: 'Menu item not found' });
      return;
    }
    res.json({
      success: true,
      data: updated,
    });
  }

  public listReviews(req: Request, res: Response): void {
    const { restaurantId } = req.query;
    const reviews = restaurantRepository.getReviews(
      typeof restaurantId === 'string' ? restaurantId : undefined
    );
    res.json({
      success: true,
      data: reviews,
    });
  }

  public addReview(req: Request, res: Response): void {
    const { restaurantId, authorName, authorRole, rating, comment, orderedDish } = req.body;
    if (!restaurantId || !authorName || !comment || typeof rating !== 'number') {
      res.status(400).json({ success: false, error: 'Missing required review fields' });
      return;
    }

    const review = restaurantRepository.createReview({
      restaurantId,
      authorName: String(authorName).trim(),
      authorRole: String(authorRole || 'Verified Diner').trim(),
      rating: Math.min(5, Math.max(1, Number(rating))),
      comment: String(comment).trim(),
      orderedDish: String(orderedDish || 'Chef Signature Selection').trim(),
    });

    res.status(201).json({
      success: true,
      data: review,
    });
  }
}

export const marketplaceController = new MarketplaceController();
