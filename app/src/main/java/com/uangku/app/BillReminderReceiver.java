package com.uangku.app;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

import androidx.core.app.NotificationCompat;

public class BillReminderReceiver extends BroadcastReceiver {

    private static final String CHANNEL_ID = "bill_reminders";
    private static final int NOTIFICATION_ID = 1001;

    @Override
    public void onReceive(Context context, Intent intent) {

        createNotificationChannel(context);

        String title = intent != null
                ? intent.getStringExtra("title")
                : null;

        String message = intent != null
                ? intent.getStringExtra("message")
                : null;

        if (title == null || title.trim().isEmpty()) {
            title = "Pengingat UangKu";
        }

        if (message == null || message.trim().isEmpty()) {
            message = "Ada tagihan yang perlu kamu cek.";
        }

        Intent openAppIntent = new Intent(context, MainActivity.class);

        openAppIntent.setFlags(
                Intent.FLAG_ACTIVITY_NEW_TASK
                        | Intent.FLAG_ACTIVITY_CLEAR_TOP
        );

        int pendingIntentFlags = PendingIntent.FLAG_UPDATE_CURRENT;

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            pendingIntentFlags |= PendingIntent.FLAG_IMMUTABLE;
        }

        PendingIntent pendingIntent = PendingIntent.getActivity(
                context,
                0,
                openAppIntent,
                pendingIntentFlags
        );

        NotificationCompat.Builder builder =
                new NotificationCompat.Builder(context, CHANNEL_ID)
                        .setSmallIcon(android.R.drawable.ic_dialog_info)
                        .setContentTitle(title)
                        .setContentText(message)
                        .setStyle(
                                new NotificationCompat.BigTextStyle()
                                        .bigText(message)
                        )
                        .setPriority(NotificationCompat.PRIORITY_DEFAULT)
                        .setAutoCancel(true)
                        .setContentIntent(pendingIntent);

        NotificationManager notificationManager =
                (NotificationManager) context.getSystemService(
                        Context.NOTIFICATION_SERVICE
                );

        if (notificationManager != null) {
            notificationManager.notify(
                    NOTIFICATION_ID,
                    builder.build()
            );
        }
    }

    private void createNotificationChannel(Context context) {

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {

            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "Pengingat Tagihan",
                    NotificationManager.IMPORTANCE_DEFAULT
            );

            channel.setDescription(
                    "Notifikasi pengingat tagihan dari UangKu"
            );

            NotificationManager notificationManager =
                    (NotificationManager) context.getSystemService(
                            Context.NOTIFICATION_SERVICE
                    );

            if (notificationManager != null) {
                notificationManager.createNotificationChannel(channel);
            }
        }
    }
}
