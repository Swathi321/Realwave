module.exports = {
  getRecentPromotions: (req, res, next) => {
    let recentPromotions = [
      { name: 'Samppa Nori', views: 254, clicks: 146, itemInCart: 5, purchase: 58 },
      { name: 'Samppa Nori', views: 254, clicks: 146, itemInCart: 8, purchase: 81 },
      { name: 'Samppa Nori', views: 254, clicks: 146, itemInCart: 1, purchase: 70 },
      { name: 'Samppa Nori', views: 254, clicks: 146, itemInCart: 2, purchase: 78 },
      { name: 'Samppa Nori', views: 254, clicks: 146, itemInCart: 9, purchase: 45 }
    ];

    res.status(200).json({
      success: true,
      data: recentPromotions
    });
  }
}