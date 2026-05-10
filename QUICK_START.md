# Quick Start - Taco Driving School

## 🚀 Deploy in 30 Seconds

```bash
npm run deploy
```

That's it! Your app will be live at `https://immacurate.co.ke`

---

## 📋 Common Commands

### Development
```bash
npm run dev          # Start local dev server (http://localhost:5173)
npm run build        # Build for production
npm run preview      # Preview production build locally
```

### Deployment
```bash
npm run deploy       # Build and deploy to Cloudflare Workers
```

### Code Quality
```bash
npm run lint         # Check code for errors
npm run format       # Auto-format code
```

### Testing
```bash
npm run test         # Run tests (if configured)
```

---

## 🔍 Check Deployment Status

```bash
# View recent deployments
wrangler deployments list

# View live logs
wrangler tail

# Check database
wrangler d1 list
```

---

## 📊 What's Deployed

✅ **Frontend**
- Landing page with hero section
- Course catalog
- Student portal (login/signup)
- Dashboard with progress tracking
- Payment management
- Schedule management

✅ **Backend**
- Authentication system
- Course API
- Student management
- Payment processing
- Lesson scheduling
- Progress tracking

✅ **Database**
- D1 (SQLite on Cloudflare)
- All tables pre-configured
- Migrations ready

---

## 🎯 Your App URL

**Live:** `https://immacurate.co.ke`

**Routes:**
- `/` - Landing page
- `/login` - Student login
- `/signup` - Register
- `/dashboard` - Student portal
- `/courses` - Browse courses
- `/payments` - Manage payments
- `/schedule` - Book lessons
- `/students` - Admin panel

---

## 🔐 Default Credentials

Check your database or admin panel for:
- Admin account
- Test student accounts
- Sample courses

---

## 📞 Support

If you encounter issues:

1. **Check logs:** `wrangler tail`
2. **Verify build:** `npm run build`
3. **Test locally:** `npm run dev`
4. **Check DNS:** Cloudflare Dashboard → DNS
5. **View errors:** Cloudflare Dashboard → Workers → Logs

---

## ✨ You're Live!

Your Taco Driving School is now running on Cloudflare's global network.

**Performance:**
- ⚡ Global CDN
- 🔒 SSL/TLS encrypted
- 🚀 Instant deployments
- 📊 Real-time analytics

---

*Ready to go live? Run: `npm run deploy`*
