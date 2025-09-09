import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, FileSpreadsheet, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ExcelRow {
  Nome: string;
  CPF: string;
  Telefone: string;
  Certificado: string;
  'E-mail': string;
}

export const FileUploader = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [filteredData, setFilteredData] = useState<ExcelRow[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [isSending, setIsSending] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const processExcelFile = useCallback((file: File) => {
    setIsProcessing(true);
    setProgress(20);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        setProgress(50);
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet);

        setProgress(80);
        // Filter rows where Certificado = 'Sim'
        const filtered = jsonData.filter(row => row.Certificado === 'Sim');
        setFilteredData(filtered);
        setFileName(file.name);
        setProgress(100);

        toast({
          title: "Arquivo processado com sucesso!",
          description: `${filtered.length} registros com certificado encontrados.`,
        });
      } catch (error) {
        console.error('Error processing file:', error);
        toast({
          title: "Erro ao processar arquivo",
          description: "Verifique se o arquivo está no formato correto.",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
        setProgress(0);
      }
    };
    reader.readAsArrayBuffer(file);
  }, [toast]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      processExcelFile(file);
    }
  }, [processExcelFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: false
  });

  const sendToWebhook = async () => {
    setIsSending(true);
    try {
      const response = await fetch('https://veronicamedeiros.app.n8n.cloud/webhook/8be520f9-c423-4e1c-833c-3b1b6ac0e83b', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filteredData)
      });

      if (response.ok) {
        toast({
          title: "Dados enviados com sucesso!",
          description: `${filteredData.length} registros foram enviados para o webhook.`,
        });
        setFilteredData([]);
        setFileName('');
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error sending data:', error);
      toast({
        title: "Erro ao enviar dados",
        description: "Tente novamente em alguns momentos.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">
          Processador de Certificados
        </h1>
        <p className="text-muted-foreground">
          Faça upload do arquivo Excel e envie os dados certificados para processamento
        </p>
      </div>

      <Card className="p-8">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all duration-300 ${
            isDragActive
              ? 'border-primary bg-primary/5 scale-105'
              : 'border-border hover:border-primary hover:bg-primary/5'
          }`}
        >
          <input {...getInputProps()} />
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">
                {isDragActive ? 'Solte o arquivo aqui' : 'Arraste seu arquivo Excel aqui'}
              </h3>
              <p className="text-muted-foreground">
                Ou clique para selecionar um arquivo (.xlsx, .xls)
              </p>
            </div>
          </div>
        </div>

        {isProcessing && (
          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span className="text-sm font-medium">Processando arquivo...</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}
      </Card>

      {filteredData.length > 0 && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-5 h-5 text-success" />
                <div>
                  <h3 className="font-semibold">Dados Processados</h3>
                  <p className="text-sm text-muted-foreground">Arquivo: {fileName}</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                {filteredData.length} registros com certificado
              </Badge>
            </div>

            <div className="max-h-60 overflow-y-auto border rounded-md">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 sticky top-0">
                  <tr>
                    <th className="text-left p-3 font-medium">Nome</th>
                    <th className="text-left p-3 font-medium">CPF</th>
                    <th className="text-left p-3 font-medium">Telefone</th>
                    <th className="text-left p-3 font-medium">E-mail</th>
                    <th className="text-center p-3 font-medium">Certificado</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((row, index) => (
                    <tr key={index} className="border-t hover:bg-muted/25">
                      <td className="p-3">{row.Nome}</td>
                      <td className="p-3">{row.CPF}</td>
                      <td className="p-3">{row.Telefone}</td>
                      <td className="p-3">{row['E-mail']}</td>
                      <td className="p-3 text-center">
                        <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {row.Certificado}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={sendToWebhook}
                disabled={isSending}
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar para Webhook
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};