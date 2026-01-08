from django.contrib import admin
from .models import Stock, Portfolio, Holding, Transaction

# These lines display the models in the admin panel.
admin.site.register(Stock)
admin.site.register(Portfolio)
admin.site.register(Holding)
admin.site.register(Transaction)