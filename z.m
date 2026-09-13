% question 1

pkg load signal;
pkg load communications;
clearvars;
close all;
clc;

num_bit = 20;
samp_per_bit = 100;
Tb = 1;
Ts = Tb/samp_per_bit;
fs = 1/Ts;

s = randi([0 1], 1, num_bit); % Random binary sequence
Xbase = 2*s -1;

% X = zeros(1, num_bit*samp_per_bit); %for quuestion one only

for i = 1:num_bit
    X((i-1)*samp_per_bit + 1:i*samp_per_bit) = Xbase(i);
end

t = 0:Tb/samp_per_bit:Tb*num_bit-Tb/samp_per_bit;
subplot(3,1,1);
plot(t,X);

fc = 0.01*fs;
[b,a] = butter(2,fc/(fs/2));
X_isi = filter(b,a,X);

subplot(3,1,2);
plot(t,X_isi);

% generate noise samples
% use the fuunction AWGN to generate noise samples
X_isi_n = awgn(X_isi, 6.6, 'measured');
subplot(3,1,3);
plot(t,X_isi_n);
figure;

X = circshift(X,samp_per_bit/2);
X_eye = reshape(X,samp_per_bit,num_bit);
X_eye_t = X_eye';
t_eye = -Tb/2:Tb/samp_per_bit:Tb/2-Tb/samp_per_bit;
subplot(1,3,1);
plot(t_eye,X_eye_t(2:num_bit,:),'g','LineWidth',3);



