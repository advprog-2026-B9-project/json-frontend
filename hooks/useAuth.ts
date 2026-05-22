import { useState, useEffect } from 'react';

interface UserData {
    username: string;
    [key: string]: any;
}

export function useAuth() {
    const [user, setUser] = useState<UserData | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error("Gagal parsing data user", error);
            }
        }
        setIsLoaded(true);
    }, []);

    return { 
        user, 
        isLoaded, 
        isAuthenticated: !!user,
        username: user?.username || '',
        userId: user?.id || ''
    };
}