-- CreateTable
CREATE TABLE "SettlementDocument" (
    "id" SERIAL NOT NULL,
    "settlementId" INTEGER NOT NULL,
    "orderId" INTEGER NOT NULL,
    "pozPdf" BYTEA,
    "invoicePdf" BYTEA,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SettlementDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SettlementDocument_settlementId_orderId_key" ON "SettlementDocument"("settlementId", "orderId");

-- AddForeignKey
ALTER TABLE "SettlementDocument" ADD CONSTRAINT "SettlementDocument_settlementId_fkey" FOREIGN KEY ("settlementId") REFERENCES "Settlement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
