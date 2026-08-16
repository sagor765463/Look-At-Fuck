import { auth, db, googleProvider } from '../lib/firebase';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signOut,
    sendPasswordResetEmail,
    onAuthStateChanged
} from 'firebase/auth';
import {
    ref,
    push,
    set,
    get,
    update,
    remove,
    query,
    orderByChild,
    limitToFirst,
    onValue,
    serverTimestamp
} from 'firebase/database';

// Helper: convert RTDB snapshot to array with id
const snapToArray = (snapshot) => {
    if (!snapshot.exists()) return [];
    const data = snapshot.val();
    return Object.entries(data).map(([id, val]) => ({ id, ...val }));
};

export const apiClient = {
    auth: {
        loginViaEmailPassword: async (email, password) => {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            return userCredential.user;
        },
        loginWithProvider: async (provider, redirectUrl) => {
            try {
                await signInWithPopup(auth, googleProvider);
                if (redirectUrl) window.location.href = redirectUrl;
            } catch (error) {
                console.error("Provider login failed", error);
            }
        },
        register: async ({ email, password }) => {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            return userCredential.user;
        },
        verifyOtp: async ({ email, otpCode }) => {
            return { access_token: 'mock_firebase_token' };
        },
        resendOtp: async (email) => { return true; },
        setToken: (token) => { },
        resetPasswordRequest: async (email) => {
            await sendPasswordResetEmail(auth, email);
            return true;
        },
        resetPassword: async ({ resetToken, newPassword }) => { return true; },
        me: () => {
            return new Promise((resolve, reject) => {
                const unsubscribe = onAuthStateChanged(auth, (user) => {
                    unsubscribe();
                    if (user) {
                        const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
                        const isAdmin = user.email === adminEmail;
                        resolve({
                            id: user.uid,
                            email: user.email,
                            name: user.displayName || 'User',
                            role: isAdmin ? 'admin' : 'user'
                        });
                    } else {
                        reject(new Error('Not authenticated'));
                    }
                });
            });
        },
        logout: async (redirectUrl) => {
            await signOut(auth);
            if (redirectUrl) window.location.href = redirectUrl;
        },
        redirectToLogin: (redirectUrl) => {
            window.location.href = `/login?redirect=${encodeURIComponent(redirectUrl)}`;
        }
    },
    entities: {
        Category: {
            list: async () => {
                const snapshot = await get(ref(db, 'categories'));
                return snapToArray(snapshot).sort((a, b) =>
                    (a.created_date || '').localeCompare(b.created_date || '')
                );
            },
            create: async (data) => {
                const newRef = push(ref(db, 'categories'));
                const payload = { ...data, created_date: new Date().toISOString() };
                await set(newRef, payload);
                return { id: newRef.key, ...payload };
            },
            delete: async (id) => {
                await remove(ref(db, `categories/${id}`));
                return true;
            }
        },
        Product: {
            list: async (sortStr = '-created_date', limitNum = 100) => {
                const snapshot = await get(ref(db, 'products'));
                const arr = snapToArray(snapshot);
                return arr.sort((a, b) =>
                    (b.created_date || '').localeCompare(a.created_date || '')
                ).slice(0, limitNum);
            },
            get: async (id) => {
                const snapshot = await get(ref(db, `products/${id}`));
                if (!snapshot.exists()) throw new Error('Not found');
                return { id, ...snapshot.val() };
            },
            filter: async (queryObj, sortStr, limitNum = 100) => {
                const snapshot = await get(ref(db, 'products'));
                const arr = snapToArray(snapshot);
                return arr
                    .filter(p => p.category === queryObj.category)
                    .slice(0, limitNum);
            },
            create: async (data) => {
                const newRef = push(ref(db, 'products'));
                const payload = { ...data, created_date: new Date().toISOString() };
                await set(newRef, payload);
                return { id: newRef.key, ...payload };
            },
            update: async (id, data) => {
                await update(ref(db, `products/${id}`), data);
                return { id, ...data };
            },
            delete: async (id) => {
                await remove(ref(db, `products/${id}`));
                return true;
            }
        },
        Order: {
            list: async (sortStr, limitNum = 200) => {
                const snapshot = await get(ref(db, 'orders'));
                const arr = snapToArray(snapshot);
                return arr.sort((a, b) =>
                    (b.created_date || '').localeCompare(a.created_date || '')
                ).slice(0, limitNum);
            },
            filterByEmail: async (email) => {
                const snapshot = await get(ref(db, 'orders'));
                const arr = snapToArray(snapshot);
                return arr
                    .filter(o => o.customer_email === email)
                    .sort((a, b) => (b.created_date || '').localeCompare(a.created_date || ''));
            },
            create: async (data) => {
                const newRef = push(ref(db, 'orders'));
                const payload = {
                    ...data,
                    status: 'pending',
                    created_date: new Date().toISOString()
                };
                await set(newRef, payload);
                return { id: newRef.key, ...payload };
            },
            update: async (id, data) => {
                await update(ref(db, `orders/${id}`), data);
                return { id, ...data };
            },
            bulkUpdate: async (dataArr) => {
                const promises = dataArr.map(d => update(ref(db, `orders/${d.id}`), d));
                await Promise.all(promises);
                return true;
            },
            subscribe: (callback) => {
                const ordersRef = ref(db, 'orders');
                const unsubscribe = onValue(ordersRef, (snapshot) => {
                    callback({ type: 'update' });
                });
                return unsubscribe;
            }
        }
    },
    integrations: {
        Core: {
            UploadFile: async ({ file }) => {
                if (!file) throw new Error("No file provided");

                const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
                const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

                const formData = new FormData();
                formData.append('file', file);
                formData.append('upload_preset', uploadPreset);

                const res = await fetch(
                    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                    { method: 'POST', body: formData }
                );

                const data = await res.json();
                if (data.secure_url) {
                    return { file_url: data.secure_url };
                } else {
                    throw new Error(data.error?.message || "Upload failed");
                }
            }
        }
    }
};
